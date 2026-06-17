import { useState } from "preact/hooks";

const Cart = ({ cartSrc }) => {
    const [counter, setCounter] = useState(0);
    return (
        <a href="#" class="ha-c" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
            <span class="ha-ci" onClick={() => setCounter(c => c + 1)}>
                <img src={cartSrc} width="20" height="20" alt="" />
                {counter > 0 && <span class="bdg">{counter}</span>}
            </span>
            <span>Корзина</span>
        </a>
    );
};

export default Cart;
