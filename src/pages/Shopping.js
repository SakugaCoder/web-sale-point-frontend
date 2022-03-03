import Layout from "../components/Layout.";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import Input from "../components/Input/Input";
import Button from "../components/Button";

import { useState, useEffect} from 'react';
import { getItems, updateItem, deleteItem, insertItem } from "../utils/SPAPPI";
import Modal from "../components/Modal/Modal";
import useModal from "../hooks/useModal";

const Container = styled.div`
    padding: 20px;
`;

const StyledInput = styled(Input)`
    background-color: red;
`;

const ButtonGroup = styled.div`
    display: flex;
    justify-content: space-between;

    & button{
        width: 45%;
    }
`;

const ControlButton = styled(Button)`
    width: 100%;
    margin-top: 20px;
    border-radius: 60px;
`;

const StyledTable = styled.table`
    border-collapse: collapse;
    border: 1px solid black;
    width: 100%;

    tbody tr:nth-child(even) {
        background-color: #eee;
    }

    td{
        padding: 10px;
    }
      
    thead tr {
        background-color: #26C485;
        color: #000;
        text-align: left;
    }
`;

export default function Suppliers(){
    const [tableData, setTableData] = useState(null);
    const [products, setProducts] = useState(null);
    const [suppliers, setSuppliers] = useState(null);
    const { modalState, setModalState, handleModalClose } = useModal();

    const fields = ['Producto', 'Kg','Fecha', 'Proveedor', 'Eliminar'];

    
    
    const initialFunction = async () => {
        let res = await getItems('Compras');
        if(res.err !== true){
            setTableData(res);
            console.log(res);
        }      


        let res_products = await getItems('Productos');
        setProducts(res_products);

        let res_suppliers = await getItems('Proveedores');
        setSuppliers(res_suppliers);
    };

    const createShopping = async evt =>{
        evt.preventDefault();
        let data = {
            product_id: Number(evt.target.product_id.value),
            kg: evt.target.kg.value,
            date: evt.target.date.value,
            supplier_id: Number(evt.target.supplier_id.value),
        };

        let res = await insertItem('compra', data);
        if(res.err === false){
            evt.target.reset(); 
            initialFunction();   
        }

        else{
            alert('Error al actualizar compra');
        }
    };
    
    /*
    const openEditModal = data => {
        setModalState({visible: true, content: editModal(data)});
    };

    const updateUser = async evt => {
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
            rol: evt.target.rol.value,
            user_id: evt.target.user_id.value
        };
        
        handleModalClose();

        let res = await updateItem('usuario', data);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al actualizar usuario');
        }
    };

    const editModal = item_data => {
        return <div className="product-card-modal">

        <p>Editar datos de <strong style={ {fontSize: 16}}>{ item_data.nombre }</strong></p>

        <form className="modal-form" onSubmit={ updateUser }>
            <input type='hidden' name='user_id' required defaultValue={item_data.id} /> 
            <Input placeholder='Nombre' label='Nombre' name='nombre' required defaultValue={item_data.nombre} /> 
            <label style={ {marginBottom: 20} }>
                <p>Rol</p>
                <select name="rol" defaultValue={'' + item_data.rol }>
                    <option value="0">Usuario</option>
                    <option value="1" selected>Administrador</option>
                </select>
            </label>
            <div className="modal-buttons">
                <Button className="bg-primary" type='submit'>Guardar</Button>
                <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };
    */

    const deleteShopping = async evt => {
        evt.preventDefault();
        let shopping_id = evt.target.shopping_id.value;
        
        handleModalClose();

        let res = await deleteItem('compra', shopping_id);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al eliminar compra');
        }
    }


    const openDeleteModal = data => {
        setModalState({visible: true, content: deleteModal(data)});
    };

    const deleteModal = item_data => {
        return <div className="product-card-modal">

        <p>¿De verdad desea eliminar esta compra?</p>

        <form className="modal-form" onSubmit={ deleteShopping }>
            <input type='hidden' name='shopping_id' defaultValue={ item_data.id } required/>
            <div className="modal-buttons" style={ {marginTop: 20} }>
                <Button className="bg-red" >Si, eliminar</Button>
                <Button type='submit' onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };

    useEffect( () => {
        initialFunction();
    }, []);


    return(
        <Layout>
            <Container>
                { products && suppliers ?
                <>
                <h2>NUEVO COMPRA</h2>
                <form onSubmit={ createShopping }>

                    <label>
                        <p>Producto</p>
                        <select name="product_id">
                            <option value="0">Producto</option>
                            { products ? products.map(product => <option value={ product.id }> {product.name} </option>) : null}
                        </select>
                    </label>

                    <StyledInput type='text' placeholder='Kg' label='Kg' name='kg' required/>
                    <StyledInput type='date' placeholder='Fecha' label='Fecha' name='date' required/>

                    <label>
                        <p>Proveedor</p>
                        <select name="supplier_id">
                            <option value="0">Proveedor</option>
                            { suppliers ? suppliers.map(supplier => <option value={ supplier.id }> {supplier.nombre} </option>) : null}
                        </select>
                    </label>

                    <ButtonGroup>
                        <ControlButton type='submit' className="bg-primary">GUARDAR</ControlButton>
                        <ControlButton type='reset' className="bg-red" >CANCELAR</ControlButton>
                    </ButtonGroup>
                </form>

                <h2>LISTA DE COMPRAS</h2>

                <div style={ { overflowX: 'auto'}}>
                    <StyledTable>
                        <thead>
                            <tr>
                                { fields.map( (item, index) => <td key={index}> { item} </td>)}
                            </tr>
                        </thead>

                        <tbody>
                            { tableData ? 
                                tableData.map( (item, index) => {
                                    return <tr key={index}>
                                        <td>{ products ? products.filter( product => item.id_producto === product.id).map( product => product.name) : item.id_producto}</td>
                                        <td>{ item.kg }</td>
                                        <td>{ item.fecha }</td>
                                        <td>{ suppliers ? suppliers.filter( supplier => item.id_proveedor === supplier.id).map( supplier => supplier.nombre) : item.id_proveedor}</td>
                                        <td><Button className="bg-red" onClick={ () => openDeleteModal(item) }><FontAwesomeIcon icon={faTimes} /> Eliminar</Button> </td>
                                        { /* <td><Button className="bg-blue" onClick={ () => openEditModal(item) }><FontAwesomeIcon icon={faPen} /> Editar</Button> </td> */}
                                    </tr>
                                })
                            : null}
                        </tbody>
                    </StyledTable>
                </div>
                </>
                : null }
            </Container>

            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>

            <style>
                {
                    `
                        label p{
                            font-weight: 600;
                        }

                        select{
                            padding: 5px;
                        }
                    `
                }
            </style>

        </Layout>
    );
}