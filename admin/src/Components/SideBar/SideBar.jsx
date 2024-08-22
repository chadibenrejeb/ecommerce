import React from 'react';
import './SideBar.css';
import { Link } from 'react-router-dom';
import add_product from '../../assets/Product_Cart.svg';
import list_product from '../../assets/Product_list_icon.svg'
const SideBar = () => {
    return (
        <div className="sidebar">
            <Link to={'/addproduct'} style={{ textDecoration: "none" }}>
                <div className='sidebar-item'>
                    <img src={add_product} alt="Add Product"/>
                    <p>Add Product</p>
                </div>
            </Link>
            <Link to={'/listproduct'} style={{ textDecoration: "none" }}>
                <div className='sidebar-item'>
                    <img src={list_product} alt="List Product"/>
                    <p> Product List </p>
                </div>
            </Link>

        </div>
    );
}

export default SideBar;
