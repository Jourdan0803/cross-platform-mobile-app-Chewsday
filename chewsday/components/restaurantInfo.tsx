export interface RestaurantInfo {
    id: string;         
    name: string;       
    rating: number;       
    image_url: string;      
    location: string;   
    categories: Category[];
    price: string;
}

interface Category {
    alias: string;
    title: string;
}
