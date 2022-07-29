import Layout from "../components/Layout.";
import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPen } from "@fortawesome/free-solid-svg-icons";
import Input, { InputFile } from "../components/Input/Input";
import Button from "../components/Button";

import { useState, useRef, useEffect} from 'react';
import { getItems, updateItem, deleteItem, insertItem } from "../utils/SP_APPI";
import Modal from "../components/Modal/Modal";
import useModal from "../hooks/useModal";

const Container = styled.div`
    padding: 20px;
`;

const StyledInput = styled(Input)`
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
export default function Clientes(){
    const [tableData, setTableData] = useState(null);
    const [currentUserImg, setCurrentUserImg] = useState('');
    const {modalState, setModalState, handleModalClose } = useModal();
    const [username, setUsername] = useState(null);
    const [error, setError] = useState('');

    const userImgRef = useRef();
    const fileTypes = ['image/png', 'image/jpg', 'image/jpeg'];
    const fields = ['Imagen', 'Nombre', 'Telefono','Eliminar', 'Modificar'];

    
    
    const initialFunction = async () => {
        let res = await getItems('clientes');
        if(res.err !== true){
            setTableData(res);
            console.log(res);
        }
    };

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

    const createClient = async evt =>{
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
            telefono: evt.target.telefono.value,
        };

        let res = await insertItem('cliente', data);
        if(res.err === false){
            evt.target.reset(); 
            initialFunction();    
        }

        else{
            alert('Error al actualizar el producto');
        }
    };
    
    const openEditModal = product_data => {
        setModalState({visible: true, content: editModal(product_data)});
    };

    const updateClient = async evt => {
        evt.preventDefault();
        let data = {
            nombre: evt.target.nombre.value,
            telefono: evt.target.telefono.value,
            client_id: evt.target.client_id.value
        };
        
        handleModalClose();

        let res = await updateItem('cliente', data);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al actualizar el cliente');
        }
    };

    const editModal = item_data => {
        return <div className="product-card-modal">

        <p>Editar datos de <strong style={ {fontSize: 16}}>{ item_data.nombre }</strong></p>

        <form className="modal-form" onSubmit={ updateClient } style={ {fontSize: '26px'} } >
            <input type='hidden' name='client_id' required defaultValue={item_data.id} /> 
            <Input placeholder='Nombre' label='Nombre' name='nombre' required defaultValue={item_data.nombre} /> 
            <Input placeholder='Telefono' label='Telefono' name='telefono' required defaultValue={item_data.telefono} /> 
            <div className="modal-buttons">
                <Button className="bg-primary" type='submit'>Guardar</Button>
                <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };


    const deleteClient = async evt => {
        evt.preventDefault();
        let client_id = evt.target.client_id.value;
        
        handleModalClose();

        let res = await deleteItem('cliente', client_id);
        if(res.err === false){
            initialFunction();    
        }

        else{
            alert('Error al eliminar el cliente');
        }
    }


    const openDeleteModal = product_data => {
        setModalState({visible: true, content: deleteModal(product_data)});
    };

    const deleteModal = item_data => {
        return <div className="product-card-modal">

        <p>¿De verdad desea eliminar a <strong style={ {fontSize: 16}}>{ item_data.nombre}</strong>?</p>

        <form className="modal-form" onSubmit={ deleteClient }>
            <input type='hidden' name='client_id' defaultValue={ item_data.id } required/>
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

    
    const checkClientName = evt => {
        evt.preventDefault();
        console.log('checking name');
        console.log(evt);
        let username = evt.target.nombre.value;
        let user_exist = tableData.find( client => client.nombre.toLowerCase() == username.toLowerCase());
        if(user_exist){
            setError('Error. usuario existe');
        }

        else{
            evt.target.action="http://localhost:3002/nuevo-cliente";
            evt.target.method="post";
            evt.target.submit();
        }
    }
    

    return(
        <Layout active='Clientes'>
            <Container>
                <h2>NUEVO CLIENTE</h2>

                <div ref={userImgRef} className='user-profile-preview rounded-full m-auto shadow-lg' style={ {width: 150, height:150, borderRadius: 100, border: 'solid 2px #000'} }></div>


                <form encType="multipart/form-data" onSubmit={ checkClientName } style={ {fontSize: 26} }>
                    <InputFile  name='foto' placeholder='Foto' onChange={ handleOnChangePhoto } />
                    <StyledInput type='text' placeholder='Nombre' label='Nombre' name='nombre' required/>
                    <StyledInput type='text' placeholder='Telefono' label='Telefono' name='telefono'/>
                    <p style={ {color: '#ff0000'} } > { error } </p>
                    <ButtonGroup>
                        <ControlButton type='submit' className="bg-primary">GUARDAR</ControlButton>
                        <ControlButton type='reset' onClick={ () => setError('') } className="bg-red" >CANCELAR</ControlButton>
                    </ButtonGroup>
                </form>

                <h2>LISTA DE CLIENTES</h2>


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
                                        <td><div className="user-profile-img" style={ {backgroundImage: `url('${ item.imagen }')`} }> </div></td>
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

            <style>
                {
                    
                    `
                        .user-profile-preview{
                            background-image: url('${currentUserImg}');
                            background-repeat: no-repeat;
                            background-size: cover;
                            backgorund-position: center;
                        }

                        .user-profile-img{
                            width: 60px;
                            height: 60px;
                            background-size: cover;
                            background-repeat: no-repeat;
                            border-radius: 50%;
                        }

                    `
                }
            </style>
        </Layout>
    );
}