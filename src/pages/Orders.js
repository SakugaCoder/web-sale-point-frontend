import Layout from "../components/Layout.";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen } from "@fortawesome/free-solid-svg-icons";
import Input from "../components/Input/Input";
import Button from "../components/Button";

import { useState, useEffect} from 'react';
import { getItems, updateItem } from "../utils/SPAPPI";
import Modal from "../components/Modal/Modal";
import useModal from "../hooks/useModal";

const Container = styled.div`
    padding: 20px;
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

export default function Pedidos(){
    const [tableData, setTableData] = useState(null);
    const { modalState, setModalState, handleModalClose } = useModal();

    const fields = ['Cliente', 'Total', 'Abono', 'Adeudo', 'Fecha', 'Enviado', 'Estado', 'Productos', 'Acciones'];

    
    const initialFunction = async () => {
        let res = await getItems('pedidos');
        console.log(res);

        if(res){
            let current_order_id = res[0].id_pedido;

            let orders = [];
            let currentOrder = [];
            res.forEach( item => {
                if(item.id_pedido === current_order_id){
                    currentOrder.push(item);
                }
                else{
                    current_order_id = item.id_pedido;
                    orders.push(currentOrder);
                    currentOrder = [];
                    currentOrder.push(item);
                }
            });
            console.log(orders);
            setTableData(orders);
        }
        
    };
    
    const openEditModal = product_data => {
        setModalState({visible: true, content: editModal(product_data)});
    };

    const updateProduct = async evt => {
        let data = {
            name: evt.target.name.value,
            price: evt.target.price.value,
            product_id: evt.target.product_id.value
        };
        
        handleModalClose();

        let res = await updateItem('producto', data);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al actualizar el producto');
        }
    };

    const editModal = item_data => {
        return <div className="product-card-modal">

        <p>Editar datos de <strong style={ {fontSize: 16}}>{ item_data.name}</strong></p>

        <form className="modal-form" onSubmit={ updateProduct }>
            <input type='hidden' name='product_id' required defaultValue={item_data.id} /> 
            <Input placeholder='Nombre' label='Nombre' name='name' required defaultValue={item_data.name} /> 
            <Input placeholder='Precio' label='Precio' name='price' required defaultValue={item_data.price} /> 
            <div className="modal-buttons">
                <Button className="bg-primary" type='submit'>Guardar</Button>
                <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
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

                <h2>LISTA DE PEDIDOS</h2>

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
                                        <td>{ item.nombre_cliente }</td>
                                        <td>{ item.total_pagar }</td>
                                        <td><Button className="bg-blue" onClick={ () => openEditModal(item) }><FontAwesomeIcon icon={faPen} /> Editar</Button> </td>
                                    </tr>
                                })
                            : null}
                        </tbody>
                    </StyledTable>
                </div>
            </Container>

            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>

        </Layout>
    );
}