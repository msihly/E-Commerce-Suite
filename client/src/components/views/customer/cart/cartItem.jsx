import React from "react";
import { useDispatch, useSelector } from "react-redux";
import * as actions from "store/actions";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import { ListItem } from "components/listItem";
import { ItemModal } from "components/views/customer";
import * as Media from "media";

const CartItem = ({ cartItemId, flavorId, hasButtons = true, listingId, price, quantity }) => {
    const history = useHistory();

    const dispatch = useDispatch();

    const isItemModalOpen = useSelector(state => state.modals.find(m => m.id === cartItemId))?.isOpen ?? false;

    const listing = useSelector(state => state.listings.find(l => l.listingId === listingId));

    const handleDelete = async () => {
        const res = await dispatch(actions.deleteCartItem({ cartItemId, history }));
        if (res?.success) toast.info(`${quantity} of ${listing.title} removed from cart`);
    };

    return (
        <ListItem className="cart-item" {...{ flavorId, listingId, price, quantity }}>
            {hasButtons &&
                <div className="item-buttons">
                    <span onClick={() => dispatch(actions.modalOpened(cartItemId))}>
                        <Media.PencilSVG />
                        {isItemModalOpen && <ItemModal {...{ cartItemId, listingId }} />}
                    </span>
                    <span onClick={handleDelete}><Media.TrashcanSVG /></span>
                </div>
            }
        </ListItem>
    );
};

export default CartItem;