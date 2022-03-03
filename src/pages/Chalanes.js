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

export default function Chalanes(){
    const [tableData, setTableData] = useState(null);
    const { modalState, setModalState, handleModalClose } = useModal();

    const fields = ['Nombre', 'Telefono','Eliminar', 'Modificar'];

    
    
    const initialFunction = async () => {
        let res = await getItems('chalanes');
        if(res.err !== true){
            setTableData(res);
            console.log(res);
        }      
    };

    const createChalan = async evt =>{
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
            telefono: evt.target.telefono.value,
        };

        let res = await insertItem('chalan', data);
        if(res.err === false){
            evt.target.reset(); 
            initialFunction();   
        }

        else{
            alert('Error al actualizar chalan');
        }
    };
    
    const openEditModal = data => {
        setModalState({visible: true, content: editModal(data)});
    };

    const updateChalan = async evt => {
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
            telefono: evt.target.telefono.value,
            chalan_id: evt.target.chalan_id.value
        };
        
        handleModalClose();

        let res = await updateItem('chalan', data);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al actualizar chalan');
        }
    };

    const editModal = item_data => {
        return <div className="product-card-modal">

        <p>Editar datos de <strong style={ {fontSize: 16}}>{ item_data.nombre }</strong></p>

        <form className="modal-form" onSubmit={ updateChalan }>
            <input type='hidden' name='chalan_id' required defaultValue={item_data.id} /> 
            <Input placeholder='Nombre' label='Nombre' name='nombre' required defaultValue={item_data.nombre} /> 
            <Input placeholder='Telefono' label='Telefono' name='telefono' required defaultValue={item_data.telefono} /> 
            <div className="modal-buttons">
                <Button className="bg-primary" type='submit'>Guardar</Button>
                <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };


    const deleteChalan = async evt => {
        evt.preventDefault();
        let chalan_id = evt.target.chalan_id.value;
        
        handleModalClose();

        let res = await deleteItem('chalan', chalan_id);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al eliminar chalan');
        }
    }


    const openDeleteModal = data => {
        setModalState({visible: true, content: deleteModal(data)});
    };

    const deleteModal = item_data => {
        return <div className="product-card-modal">

        <p>¿De verdad desea eliminar a <strong style={ {fontSize: 16}}>{ item_data.nombre}</strong>?</p>

        <form className="modal-form" onSubmit={ deleteChalan }>
            <input type='hidden' name='chalan_id' defaultValue={ item_data.id } required/>
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
                <h2>NUEVO CHALAN</h2>

                <form onSubmit={ createChalan }>

                    <StyledInput type='text' placeholder='Nombre' label='Nombre' name='nombre' required/>
                    <StyledInput type='text' placeholder='Telefono' label='Telefono' name='telefono'/>

                    <ButtonGroup>
                        <ControlButton type='submit' className="bg-primary">GUARDAR</ControlButton>
                        <ControlButton type='reset' className="bg-red" >CANCELAR</ControlButton>
                    </ButtonGroup>
                </form>

                <h2>LISTA DE CHALANES</h2>

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
                                        <td>{ item.nombre }</td>
                                        <td>{ item.telefono }</td>
                                        <td><Button className="bg-red" onClick={ () => openDeleteModal(item) }><FontAwesomeIcon icon={faTimes} /> Eliminar</Button> </td>
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