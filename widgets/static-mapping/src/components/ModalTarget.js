/** @type {Vue.ComponentOptions} */
const ModalTargetComponent = {
    render (createElement) {
        return createElement(
            'div',
            {
                class: 'modal-target',
                style: {
                    display: this.modals.length > 0 ? 'block' : 'none'
                },
                on: {
                    /** @param {MouseEvent} e */
                    click: e => {
                        if (e.target === e.currentTarget)
                            this.modals.forEach(modal => modal.$emit('close'));
                    }
                }
            },
            
            this.modals.map(modal => createElement('div', {
                class: 'modal',
                attrs: modal.$attrs
            }, modal.$slots.default))
        );

    },

    data: function () {
        return {
            modals: []
        };
    },

    created() {
        this.$modal.registerModalTarget(this);
    }
};

export default ModalTargetComponent;