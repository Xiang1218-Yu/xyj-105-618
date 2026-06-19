export const areaSlice = {
    assignCat(area, index, cat) {
        this.state.areaAssignments[area][index] = cat;
        this._emit('areas:changed', { area, index });
    },

    removeCatFromArea(catId) {
        for (const area of Object.keys(this.state.areaAssignments)) {
            const idx = this.state.areaAssignments[area].findIndex(c => c && c.id === catId);
            if (idx !== -1) {
                this.state.areaAssignments[area][idx] = null;
                this._emit('areas:changed', { area, index: idx });
                return { area, index: idx };
            }
        }
        return null;
    },

    setAreaCapacity(area, delta) {
        this.state.areaCapacities[area] += delta;
        this._emit('areas:changed', { area });
    }
};
