/* @flow */
import merge from './merge'

type MapFn<T, V> = (v: T, index?: number) => V;
type FilterFn<T> = (v: T, index?: number) => boolean;
type SortFn<T> = (a: T, b: T) => number;
type FindFn<T> = (element: T, index?: number, arr?: Array<T>, thisArg?: Object) => boolean;
type SetFn<T> = (element: T) => T;

export type Id = string;
export type CollectionItem = {
    id: Id;
}
type DeletedItems<T> = {[id: Id]: [T, number]};
type CollectionRec<T> = {
    items?: Array<T>;
    deleted?: DeletedItems<T>;
    itemsMap?: {[id: Id]: T};
}
type UpdateFn<V> = (oldItem: V) => V;

type CreateItem<V> = (rawItem: Object) => V;

type ItemRec = {};

export type Collection<Item: CollectionItem> = {
    createItem(item: ItemRec): Item;
    fromArray(items: Array<ItemRec>): Collection<Item>;
    add(item: Item): Collection<Item>;
    remove(id: Id): Collection<Item>;
    softRemove(id: Id): Collection<Item>;
    restore(id: Id): Collection<Item>;
    get(id: Id): Item;
    set(id: Id, item: Item): Collection<Item>;
    update(id: Id, updateFn: UpdateFn<Item>): Collection<Item>;
    find(findFn: FindFn<Item>): Item;
    map<V>(mapFn: MapFn<Item, V>): Array<V>;
    filter(filterFn: FilterFn<Item>): Collection<Item>;
    sort(sortFn: SortFn<Item>): Collection<Item>;
}

type ItemsMap<Item> = {
    [id: Id]: Item
}

// implements Collection<Item>
export default class BaseCollection<Item: CollectionItem> {
    _items: Array<Item>;
    _deleted: DeletedItems<Item>;
    _itemsMap: ItemsMap<Item>;
    length: number;

    constructor(rec?: CollectionRec<Item>|Array<ItemRec> = []) {
        if (Array.isArray(rec)) {
            const {items, itemsMap} = this._recsToItems(rec)
            this._items = items
            this._itemsMap = itemsMap
            this._deleted = {}
        } else {
            this._items = rec.items || []
            this._deleted = rec.deleted || {}
            this._itemsMap = rec.itemsMap || {}
        }
        this.length = this._items.length
    }

    createItem<T: ItemRec>(rec: T): Item {
        // override
    }

    _copy(rec: CollectionRec<Item>): Collection<Item> {
        return merge(this, rec)
    }

    _getDeleted(id: Id): {
        items: Array<Item>,
        deleted: DeletedItems<Item>
    } {
        const oldItems = this._items
        const items: Array<Item> = [];
        const deleted: DeletedItems<Item> = {};
        for (let i = 0, l = oldItems.length; i < l; i++) {
            const item = oldItems[i]
            if (item.id !== id) {
                items.push(item)
            } else {
                deleted[id] = [item, i]
            }
        }

        return {items, deleted}
    }

    _recsToItems(recs: Array<ItemRec>): {
        items: Array<Item>,
        itemsMap: ItemsMap<Item>
    } {
        const items: Array<Item> = [];
        const itemsMap: ItemsMap<Item> = {};
        for (let i = 0, l = recs.length; i < l; i++) {
            const item: Item = this.createItem(recs[i]);
            itemsMap[item.id] = item
            items.push(item)
        }

        return {itemsMap, items}
    }

    fromArray(recs: Array<ItemRec>): Collection<Item> {
        const {items, itemsMap} = this._recsToItems(recs)
        return this._copy({
            items,
            itemsMap,
            deleted: {}
        })
    }

    add(item: Item): Collection<Item> {
        const itemsMap: ItemsMap<Item> = {...this._itemsMap};
        itemsMap[item.id] = item

        return this._copy({
            items: this._items.concat([item]),
            itemsMap
        })
    }

    remove(id: Id): Collection<Item> {
        const itemsMap: ItemsMap<Item> = {...this._itemsMap};
        delete itemsMap[id]

        return this._copy({
            items: this._getDeleted(id).items,
            itemsMap
        })
    }

    softRemove(id: Id): Collection<Item> {
        return this._copy({
            ...this._getDeleted(id)
        })
    }

    restore(id: Id): Collection<Item> {
        if (!this._deleted[id]) {
            throw new Error('Element not exists in collection: ' + id)
        }
        const [item, index] = this._deleted[id]
        delete this._deleted[id]
        const items = [].concat(this._items)
        items.splice(index, 0, item)
        return this._copy({items})
    }

    get(id: Id): Item {
        const item: Item = this._itemsMap[id];
        if (!item) {
            throw new Error('Element not exists in collection: ' + id)
        }
        return item
    }

    update(id: Id, updateFn: UpdateFn<Item>): Collection<Item> {
        const oldItems: Array<Item> = this._items;
        const items: Array<Item> = [];
        let isFound: boolean = false;
        let isChanged: boolean = false;
        for (let i = 0, l = oldItems.length; i < l; i++) {
            const item = oldItems[i]
            if (item.id !== id) {
                items.push(item)
            } else {
                isFound = true
                const newItem: Item = updateFn(item);
                if (item !== newItem) {
                    isChanged = true
                }
                items.push(newItem)
            }
        }
        if (!isFound) {
            throw new Error('Element not exists in collection: ' + id)
        }

        return isChanged ? this._copy({items}) : this
    }

    set(id: Id, newItem: Item): Collection<Item> {
        return this.update(id, () => newItem)
    }

    find(findFn: FindFn<Item>): Item {
        return this._items.find(findFn)
    }

    map<V>(mapFn: MapFn<Item, V>): Array<V> {
        return this._items.map(mapFn)
    }

    filter(filterFn: FilterFn<Item>): Collection<Item> {
        const items = this._items.filter(filterFn)

        return items.length !== this.length
            ? this._copy({items})
            : this
    }

    sort(sortFn: SortFn<Item>): Collection<Item> {
        const oldItems = this._items
        const items = oldItems.sort(sortFn)

        let isChanged: boolean = false;
        for (let i = 0, l = items.length; i < l; i++) {
            if (items[i].id !== oldItems[i].id) {
                isChanged = true
                break
            }
        }

        return isChanged ? this._copy({items}) : this
    }
}

(BaseCollection.prototype: Object)[Symbol.iterator] = function iterator() {
    return {
        next() {
            let rec
            if (this._pos < this._items.length) {
                rec = {value: this._items[this._pos], done: false}
                this._pos++
            } else {
                rec = {done: true}
            }
            return rec
        },
        items: this._items,
        _pos: 0
    }
}
