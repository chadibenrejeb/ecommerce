import React, { useEffect, useState } from 'react';
import "./ListProduct.css";
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
    const [allproducts, setAllProducts] = useState([]);

    const fetchInfo = async () => {
        try {
            const response = await fetch('http://localhost:4000/allproducts');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched data:', data);
            if (Array.isArray(data)) {
                setAllProducts(data);
            } else {
                console.error('Expected an array but got:', data);
                setAllProducts([]);
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setAllProducts([]);
        }
    };

    useEffect(() => {
        fetchInfo();
    }, []);

    return (
        <div className='list-product'>
            <h1>ALL PRODUCTS LIST</h1>
            <div className='listproduct-format-main'>
                <p>Products</p>
                <p>Title</p>
                <p>Old Price</p>
                <p>New Price</p>
                <p>Category</p>
                <p>Remove</p>
            </div>
            <div className='listproduct-allproducts'>
                <hr />
                {Array.isArray(allproducts) && allproducts.length > 0 ? (
                    allproducts.map((product, index) => (
                        <div key={index} className='listproduct-format-main listproduct-format'>
                            <img src={product.image} alt={`${product.name} image`} className='listproduct-product-icon' />
                            <p>{product.name}</p>
                            <p>{product.old_price} TND</p>
                            <p>{product.new_price} TND</p>
                            <p>{product.category}</p>
                            <img className='listproduct-remove-icon' src={cross_icon} alt='Remove product' />
                        </div>
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>
        </div>
    );
};

export default ListProduct;
