export const catSlice = {
    addCat(cat) {
        this.state.cats.push(cat);
        this._emit('cats:changed', { type: 'add', cat });
    },

    updateCat(catId, updates) {
        const cat = this.findCat(catId);
        if (!cat) return;
        Object.assign(cat, updates);
        this._emit('cats:changed', { type: 'update', cat });
    },

    selectCat(catId) {
        this.state.selectedCatId = catId;
        this._emit('cat:selected', catId);
    }
};
