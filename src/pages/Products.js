import Layout from "../components/Layout.";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import Input, { InputFile } from "../components/Input/Input";
import Button from "../components/Button";

import { useState, useRef, useEffect} from 'react';
import { getItems, updateItem, deleteItem } from "../utils/SP_APPI";
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
    font-size: 22px;
    tbody tr:nth-child(even) {
        background-color: #eee;
    }

    td{
        padding: 5px;
    }
      
    thead tr {
        background-color: #26C485;
        color: #000;
        text-align: left;
    }
`;

export default function Productos(){
    const [currentUserImg, setCurrentUserImg] = useState('');
    const [tableData, setTableData] = useState(null);
    const { modalState, setModalState, handleModalClose } = useModal();

    const userImgRef = useRef();
    const fileTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    const fields = ['Imagen', 'Nombre', 'Precio', 'Eliminar', 'Modificar'];

    
    const handleOnChangePhoto = (evt) => {
        console.log(evt.target.files);
        if(evt.target.files.length > 0){
            let file = evt.target.files[0];
            console.log(file);
            if(fileTypes.includes(file.type)){
                let fr = new FileReader()
                if(fr){
                    fr.readAsDataURL(file);
                }
    
                fr.onloadend = ()  => {
                    //console.log(fr.result);
                    setCurrentUserImg(fr.result);
                }
            }
            else{
                alert('Tipo de archivo no permitido');
            }
        }
    };
    
    const initialFunction = async () => {
        let res = await getItems('Productos');
        console.log(res);
        setTableData(res);
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


    const deleteProduct = async evt => {
        let product_id = evt.target.product_id.value;
        
        
        handleModalClose();

        let res = await deleteItem('producto', product_id);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al eliminar el producto');
        }
    }


    const openDeleteModal = product_data => {
        setModalState({visible: true, content: deleteModal(product_data)});
    };

    const deleteModal = item_data => {
        return <div className="product-card-modal">

        <p>¿De verdad desea eliminar <strong style={ {fontSize: 16}}>{ item_data.name}</strong>?</p>

        <form className="modal-form" onSubmit={ deleteProduct }>
            <input type='hidden' name='product_id' defaultValue={ item_data.id } required/>
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
        <Layout active='Productos'>
            <Container>
                <h2>NUEVO PRODUCTO</h2>
                <div ref={userImgRef} className='user-profile-preview rounded-full m-auto shadow-lg' style={ {width: 150, height:150, borderRadius: 100, border: 'solid 2px #000'} }></div>

                <form action="http://localhost:3002/nuevo-producto" method="post" encType="multipart/form-data">
                    <InputFile  name='foto' placeholder='Foto' onChange={ handleOnChangePhoto } />

                    <StyledInput type='text' placeholder='Nombre' label='Nombre' name='nombre'/>
                    <StyledInput type='text' placeholder='Precio' label='Precio' name='precio'/>

                    <ButtonGroup>
                        <ControlButton type='submit' className="bg-primary">GUARDAR</ControlButton>
                        <ControlButton type='reset' className="bg-red" >CANCELAR</ControlButton>
                    </ButtonGroup>
                </form>

                <h2>LISTA DE PRODUCTOS</h2>

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
                                        <td><img src={ item.img }  style={ {maxWidth: 90} }/></td>
                                        <td>{ item.name }</td>
                                        <td>{ item.price }</td>
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

            <style>
                {
                    
                    `
                        .user-profile-preview{
                            background-image: url('${currentUserImg}');
                            background-repeat: no-repeat;
                            background-size: cover;
                            backgorund-position: center;
                        }

                    `
                }
            </style>
        </Layout>
    );
}