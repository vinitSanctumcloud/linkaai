import { API } from '@/config/api';

export const getStripeProducts = async () => {
    try {
        const response = await fetch(API.STRIPE_PRODUCTS, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        console.log(response, "hello")

        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }

        const data = await response.json();
        console.log(data, "data from stripe products")
        return data;
    } catch (error) {
        console.error('Error fetching Stripe products:', error);
        throw error;
    }
}
