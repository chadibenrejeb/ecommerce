import React, { useEffect, useState } from 'react';
import "./ListProduct.css";
import cross_icon from '../../assets/cross_icon.png';

const ListProduct = () => {
    const [allproducts, setAllProducts] = useState([]);

    const fetchInfo = async () => {
        try {
            const response = await fetch('http://localhost:4000/allproducts');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Fetched data:', responseData);

            // Check if the response contains a `data` field and it's an array
            if (responseData.success && Array.isArray(responseData.data)) {
                setAllProducts(responseData.data);
            } else {
                console.error('Expected an array but got:', responseData);
                setAllProducts([]); // Set to empty array if data is not valid
            }
        } catch (error) {
            console.error('Failed to fetch products:', error);
            setAllProducts([]); // Set to empty array in case of error
        }
    };


    useEffect(() => {
        fetchInfo();
    }, []);

    const remove_product = async (id) => {
       await fetch('http://localhost:4000/removeproduct', {
           method: 'POST',
           headers : {
               Accept: 'application/json',
               'Content-Type': 'application/json',
           },
           body: JSON.stringify({id:id})
       })
        await fetchInfo();
    }

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
                            <img onClick={()=> remove_product(product.id)} className='listproduct-remove-icon' src={cross_icon} alt='Remove product' />
                        </div>
                    ))
                ) : (
                    <p>No products available.</p>
                )}
            </div>
            <hr/>
        </div>
    );
};

export default ListProduct;
