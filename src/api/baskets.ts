
interface ShopableItem {
    scKey?: string;
    price?: number;
    caption?: string;
    category?: string;
}


class Basket {
    items: ShopableItem[];
    name: string;

    constructor() {
        this.name = 'Basket';
        const store = localStorage.getItem(this.name);
        if (!store || store === null) {
            this.items = [];
            localStorage.setItem(this.name, JSON.stringify(this.items));
        }
        console.log('loading basket from store');
        this.items = JSON.parse(store!);
    }

    addItem(item: ShopableItem) {
        if (this.items) {
            const newItem = {...item}
            newItem.price ? newItem : newItem.price = 0;
            this.items.push(newItem);
            localStorage.setItem(this.name, JSON.stringify(this.items));
            console.log(newItem.scKey + ' added to the basket');
        }
    }

    removeItem(item: ShopableItem) {
        const index = this.items.findIndex(i => i.scKey === item.scKey);
        const removed = this.items.splice(index, 1);
        localStorage.setItem(this.name, JSON.stringify(this.items));
        console.log('item removed');
        console.log(removed);

    }

    countItem(item: ShopableItem) {
        const current = this.items ? [...this.items] : [];
        const items = current.filter(i => i.scKey == item.scKey);
        return items.length;
    }

    getTotalPrice() {
        const current = [...this.items];
        return current.reduce((acc, item) => acc + item.price!, 0);
    }

    getGrandTotalPrice() {
        const itemCosts = this.getTotalPrice();
        const tax = this.getTaxValue();
        return itemCosts + tax;
    }

    getItemSummary() {
        const current = [...this.items];
        const uniqueArr = current.filter((obj, index, self) => {
            return index === self.findIndex((t) => t.scKey === obj.scKey);
          });
        return uniqueArr;
    }

    getTaxValue() {
        const tax = this.getTotalPrice() * 0.11;
        return tax;
    }
}

const basket = new Basket();
console.log('empty basket created');
console.log(basket);

export default Basket;