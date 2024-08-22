import React from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';

const AddProduct = () => {

    const [image, setImage] = React.useState(false);
    const [productDetails, setProductDetails] = React.useState({
        name: '',
        image: '',
        category: 'women',
        old_price: '',
        new_price: ''
    });

    const imageHandler = (e) => {
        const file = e.target.files[0];
        setImage(file);
        setProductDetails({ ...productDetails, image: file });
    };

    const changeHandler = (e) => {
        setProductDetails({ ...productDetails, [e.target.name]: e.target.value });
    };

    const Add_product = async () => {
        console.log(productDetails);
        let responseData;
        let product = { ...productDetails }; // Clone the productDetails

        let formData = new FormData();
        formData.append('product', image); // Append the image file

        try {
            const response = await fetch('http://localhost:4000/upload', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                },
                body: formData
            });

            // Check if response is OK
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            // Parse response as JSON
            responseData = await response.json();

            if (responseData.success) {
                product.image = responseData.image_url;
                console.log(product);
                await fetch('http://localhost:4000/addproduct' , {
                    method: 'POST',
                    headers : {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(product)

                }).then((res) => res.json()).then((data) => {
                    data.success? alert("Product Added") : alert("Failed to add product");
                })
            } else {
                console.error('Upload failed:', responseData);
            }
        } catch (error) {
            console.error('Error uploading the product:', error);
        }
    };


    return (
        <div className='add-product'>
            <div className='addproduct-itemfield'>
                <p>Product Title</p>
                <input value={productDetails.name} onChange={changeHandler} type='text' name='name' placeholder='Title' />
            </div>
            <div className='addproduct-price'>
                <div className='addproduct-itemfield'>
                    <p>Price</p>
                    <input value={productDetails.old_price} onChange={changeHandler} type='text' name='old_price' placeholder='Old Price' />
                </div>
                <div className='addproduct-itemfield'>
                    <p>Offer Price</p>
                    <input value={productDetails.new_price} onChange={changeHandler} type='text' name='new_price' placeholder='New Price' />
                </div>
            </div>
            <div className='addproduct-itemfield'>
                <p>Product Category</p>
                <select value={productDetails.category} onChange={changeHandler} name='category' className='add-product-selector'>
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="kids">Kids</option>
                </select>
            </div>
            <div className='addproduct-itemfield'>
                <label htmlFor='file-input'>
                    <img src={image ? URL.createObjectURL(image) : upload_area} alt="" className='addproduct-thumbnail-img' />
                </label>
                <input type='file' name='image' id='file-input' hidden onChange={imageHandler} />
            </div>
            <button onClick={Add_product} className='addproduct-btn'>ADD</button>
        </div>
    );
};

export default AddProduct;
