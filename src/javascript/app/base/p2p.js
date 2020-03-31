const Client              = require('./client');
const BinarySocket        = require('./socket');
const getPropertyValue    = require('../../_common/utility').getPropertyValue;
const SubscriptionManager = require('../../_common/base/subscription_manager').default;

const P2p = (() => {
    const p2p_order_list = [];
    const p2p_notification_count = [];

    const handleNotifications = orders => {
        let notification_count = 0;

        orders.forEach(order => {
            const type = order.is_incoming
                ? getPropertyValue(order, ['advert_details', 'type'])
                : order.type;

            // show notifications for:
            // 1. buy orders that are pending buyer payment, or
            // 2. sell orders that are pending seller confirmation
            if (type === 'buy' ? order.status === 'pending' : order.status === 'buyer-confirmed') {
                notification_count++;
            }
        });

        p2p_notification_count.push(notification_count);
    };

    const handleP2pOrderList = (order_response) => {
        // check if there is any error
        if (!order_response.error) {
            if (order_response.p2p_order_list) {
                // it's an array of orders from p2p_order_list
                p2p_order_list.push(...getPropertyValue(order_response, ['p2p_order_list', 'list']));
                handleNotifications(p2p_order_list);
            } else {
                // it's a single order from p2p_order_info
                const idx_order_to_update = p2p_order_list.findIndex(
                    order => order.id === order_response.p2p_order_info.id
                );
                const updated_orders = [...p2p_order_list];
                // if it's a new order, add it to the top of the list
                if (idx_order_to_update < 0) {
                    updated_orders.unshift(order_response.p2p_order_info);
                } else {
                    // otherwise, update the correct order
                    updated_orders[idx_order_to_update] = order_response.p2p_order_info;
                }
                // trigger re-rendering by setting orders again
                p2p_order_list.push(...updated_orders);
                handleNotifications(updated_orders);
            }
        }
    };

    const clientAllowedP2p =  () => {
        const is_logged_in = Client.isLoggedIn();
        const is_usd   = Client.get('currency') === 'USD';
        const is_virtual = Client.get('is_virtual');
        const is_svg = Client.get('landing_company_shortcode') === 'svg';
        const is_show_dp2p = /show_dp2p/.test(window.location.hash);

        return is_logged_in && !is_virtual && is_svg && is_usd && is_show_dp2p;
    };
    const init = async () => {
        if (clientAllowedP2p()) {
            await BinarySocket.wait('authorize');
            SubscriptionManager.subscribe('p2p_order_list', { p2p_order_list: 1, subscribe: 1 }, handleP2pOrderList);
        }
        
    };

    return {
        clientAllowedP2p,
        init,
        p2p_notification_count,
        p2p_order_list,
    };
})();

module.exports = P2p;
