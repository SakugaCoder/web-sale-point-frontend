import Layout from "../components/Layout.";
import styled from "styled-components";

import Button from "../components/Button";

import { useState, useEffect, useMemo} from 'react';
import { getItems, SP_API } from "../utils/SP_APPI";
import Modal from "../components/Modal/Modal";
import useModal from "../hooks/useModal";
import Keypad from "../components/Keypad";
import NormalButton from "../components/Button";

import { useTable, useSortBy } from "react-table";
import { roundNumber } from "../utils/Operations";

const Container = styled.div`
    padding: 20px;
`;

const StyledTable = styled.table`
    border-collapse: collapse;
    border: 1px solid black;
    width: 100%;
    font-size: 20px;

    tbody tr:nth-child(even) {
        background-color: #eee;
    }

    td{
        padding: 2px;
    }
      
    thead tr th {
        background-color: #26C485;
        color: #000;
        text-align: left;
        padding: 2px;
    }
`;

const OrderDetailContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
    margin-bottom: 20px;
`;

const OrderDetail = styled.div`
`;

const Detail = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-around;

    & > p:nth-child(2){
        margin-left: 10px;
    }
`;

const ContraEntrega = styled.div`
    display: 'block';
    margin: 'auto';

    h2{
        text-align: center;
        font-weight: normal;
        margin-bottom: 10px;
        font-size: 26px;
    }

    select{
        display: block;
        font-size: 24px;
        margin: auto;
        margin-bottom: 20px
    }
`;

const ModalButtons = styled.div`
    display: flex;
    justify-content: space-between;
    margin-top: 20px;

    & button{
        width: 45%;
    }
`;

const ModalForm = styled.form`
    width: 100%;

    & label{
        display: block;
        max-width: 100%;
    }

    & label input{
        width: 100%;
        font-size: 18px;
        margin-bottom: 40px;
    }
`;

const Total = styled.p` 
    font-size: 36px;
    text-align: center;
    margin-bottom: 0px;
    margin-top: 0px;
`;

const Change = styled.p`
    font-size: 36px;
    text-align: center;
    margin-top: 5px;
`;

const PaymentAmount = styled.p` 
    font-size: 36px;
    font-weight: 600;
    text-align: center;
`;

const ActionButton = styled.button`
    display: block;
    border: solid 1px #000;
    font-weight: 700;
    font-size: 18px;
    text-transform: uppercase;
    padding: 18px 8px;
    border-radius: 5px;

    ${props => props.ml ? 'margin-left: 5px;' : ''}

    &:hover{
        cursor: pointer;
        background-color: white;
        border-color: #000;
    }

`;

const getOrderStatusLabel = status_id => {
    let chalan = status_id.chalan;
    status_id = status_id.estado;

    switch(status_id){
        case 1:
            return <span className="badge badge-primary">Pagado</span> 
        

        case 2:
            return <span className="badge badge-red">Fiado</span> 
        

        case 3:
            return <span className="badge badge-blue">Enviado ({chalan})</span> 
        

        case 4:
            return <span className="badge badge-blue">PCE</span>
        
        default:
            return null;
    };
};

export default function Pedidos(){
    const [tableData, setTableData] = useState(null);
    const [orders, setOrders] = useState(null);
    const [chalanes, setChalanes] = useState(null);
    const [clients, setClients] = useState(null);
    const [filters, setFilters] = useState({fecha: null, cliente: null, chalan: null, estado: null});
    const { modalState, setModalState, handleModalClose } = useModal();
    const { modalState: paymentModalState, setModalState: setPaymentModalState, handleModalClose: handlePaymentModalClose } = useModal();
    const [ currentNumber, setCurrentNumber ] = useState('');
    const [ currentOrder, setCurrentOrder] = useState(null);

    const initialFunction = async () => {
        let res = await getItems('pedidos');
        console.log(res);

        let res_chalanes = await getItems('chalanes');
        let res_clientes = await getItems('clientes');
        console.log(res_chalanes);

        setChalanes(res_chalanes);
        setTableData(res);
        setOrders(res); 
        setClients(res_clientes);
    };
    
    const openEditModal = product_data => {
        setModalState({visible: true, content: editModal(product_data)});
    };

    const openFiarModal = product_data => {
        setModalState({visible: true, content: fiarModal(product_data)});
    };

    const openDetailModal = order_data => {
        setModalState({visible: true, content: detailModal(order_data)});
    };

    const payOrder = async order => {
        let data = {
            total: order.total_pagar,
            order_id: order.id,
            cajero: localStorage.getItem('username')
        };

        console.log(data);
        handleModalClose();

        try {
            let res = await SP_API('http://localhost:3002/pagar-pedido', 'POST', data); 
                    
            if(res.error === false){
                initialFunction();
            }

            else{
                alert('Error al actualizar el producto');
            }   
        } catch (error) {
            console.log(error);
        }
    };


    const payOrderPCE = async evt => {
        evt.preventDefault();
        setCurrentNumber('');
        if(evt.target.contra_entrega.value !== '0'){
            let order = {
                order_id: evt.target.order_id.value,
                chalan: evt.target.contra_entrega.value,
            }
    
            let res = await SP_API('http://localhost:3002/pce-pedido', 'POST', order); 
    
            console.log(res);
            if(res.error === false){
                window.location.reload();
            }
        }

        else{
            payOrder({total_pagar: evt.target.total_pagar.value, id: evt.target.order_id.value});
            handlePaymentModalClose();
        }
    };

    const fiarOrder = async (evt, order_detail) => {
        evt.preventDefault();
        let order = {
            order_id: order_detail.id,
            cajero: localStorage.getItem('username')
        }

        let res = await SP_API('http://localhost:3002/fiar-pedido', 'POST', order); 

        console.log(res);
        if(res.error === false){
            window.location.reload();
        }
    }

    const getOrderDetail = async order_id => {
        let res_order_detail = await getItems('pedido/'+order_id);
        return res_order_detail;
    };

    const getOrderStatusText = n => {
        switch(n){
            case 1:
                return 'Pagado';
            case 2:
                return 'Adeudo';
            case 3:
                return 'Enviado';
            case 4:
                return 'PCE';

            default:
                return '';
        }
    }

    const printTicket = async ticket_order => {
        let res_order_detail = await getOrderDetail(ticket_order.id);
        let adeudo_res = await SP_API(`http://localhost:3002/obtener-adeudo/${ticket_order.id_cliente}/${ticket_order.id}`, 'GET');
        ticket_order.detalle = res_order_detail;

        let final_ticket_data = {
            id_pedido: ticket_order.id,
            fecha: ticket_order.fecha,
            cajero: localStorage.getItem('username'),
            chalan: ticket_order.chalan ? ticket_order.chalan.split(',')[0] : 'NA',
            cliente: ticket_order.id_cliente,
            adeudo: roundNumber(adeudo_res.adeudo),// ticket_order.adeudo,
            estado_nota: getOrderStatusText(ticket_order.estado),
            efectivo: null,
            productos: ticket_order.detalle
        };

        console.log(final_ticket_data);
        return null;
        let res = await SP_API('http://localhost:3002/imprimir-ticket', 'POST', final_ticket_data);
        alert('Ticket impreso');
    };

    const chalanesSelect = chalanes ? <select name='contra_entrega'>
    <option value='0'>Seleccionar chalan</option>
    { chalanes.map( chalan => <option value={chalan.id + ',' + chalan.nombre}>{ chalan.nombre}</option>) }
</select> : null;

    const editModal = order => {
        return <div className="product-card-modal">

        <p style={ {fontSize: 24} }>Confirma que recibio la cantidad de <strong style={ {fontSize: 24} }>${order.total_pagar}</strong> por parte de <strong style={ {fontSize: 24} }>{ order.chalan.split(',')[1]}</strong></p>

        <form className="modal-form" onSubmit={  () => payOrder(order) }>
            <div className="modal-buttons">
                <Button className="bg-primary" type='submit'>Cobrar</Button>
                <Button className="bg-red" onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };

    const fiarModal = order => {
        return <div className="product-card-modal">

        <p style={ {fontSize: 24}}>Confirma fiar al cliente <strong style={ {fontSize: 24}}>{ order.nombre_cliente}</strong> la cantidad de <strong style={ {fontSize: 24}}>${ order.total_pagar}</strong></p>

        <form className="modal-form" onSubmit={  event => fiarOrder(event, order) }>
            <div className="modal-buttons">
                <Button className="bg-red" type='submit'>Fiar</Button>
                <Button className="bg-white" onClick={ handleModalClose }>Cancelar</Button>
            </div>
        </form>
    </div>
    };
    
    const detailModal = order => {
        return <div className="product-card-modal">

        <p style={ {fontSize: 20} }>Detalle pedido de <strong>{ order.nombre_cliente}</strong></p>

        <OrderDetailContainer>
            <OrderDetail>
                <Detail>
                    <p><strong>Fecha:</strong></p> <p>{ order.fecha }</p>
                </Detail>
            </OrderDetail>
            <OrderDetail>
                <Detail>
                    <p><strong>Cajero:</strong></p> <p>{ order.cajero }</p>
                </Detail>
            </OrderDetail>
            <OrderDetail>
                <Detail>
                    <p><strong>Productos:</strong></p> <p>{ order.productos }</p>
                </Detail>
            </OrderDetail>

            <OrderDetail>
                <Detail>
                    <p><strong>Total pagar:</strong></p> <p>${ order.total_pagar }</p>
                </Detail>
            </OrderDetail>
        </OrderDetailContainer>

        <Button className="bg-white" type='submit' onClick={ handleModalClose }>Cerrar</Button>
    </div>
    };

    const filterOrders = (evt, filter) => {
        // console.log(orden);
        if(filter === 'estado'){
            let orden = Number(evt.target.value);
            if(orden === 0){
                setTableData(orders);
            }
    
            else{
                setTableData(orders.filter(order => order.estado === orden));
            }
        }

        else if(filter === 'chalan'){
            let chalan = evt.target.value;
            if(chalan === '0'){
                setTableData(orders);
            }
            else{
                setTableData(orders.filter(order => order.chalan === chalan));
            }
        }
    }

    useEffect( () => {
        initialFunction();
    }, []);

    function Table({ columns, data }) {
        const {
          getTableProps,
          getTableBodyProps,
          headerGroups,
          rows,
          prepareRow,
        } = useTable(
          {
            columns,
            data,
          },
          useSortBy
        )
      
        // We don't want to render all 2000 rows for this example, so cap
        // it at 20 for this use case
        // const firstPageRows = rows.slice(0, 20)
      
        return (
          <>
            <StyledTable {...getTableProps()}>
              <thead>
                {headerGroups.map(headerGroup => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map(column => (
                      // Add the sorting props to control sorting. For this example
                      // we can add them into the header props
                      <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                        {column.render('Header')}
                        {/* Add a sort direction indicator */}
                        <span>
                          {column.isSorted
                            ? column.isSortedDesc
                              ? ' 🔽'
                              : ' 🔼'
                            : ''}
                        </span>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {rows.map(
                  (row, i) => {
                    prepareRow(row);
                    return (
                      <tr {...row.getRowProps()}>
                        {row.cells.map(cell => {
                          return (
                            <td {...cell.getCellProps()}>{cell.render('Cell')}</td>
                          )
                        })}
                      </tr>
                    )}
                )}
              </tbody>
            </StyledTable>
            <br />
          </>
        );
    };


    function filterData(){
        return tableData.filter( item => {
            // Filter by date
            if(filters.fecha)
                return item.fecha === filters.fecha;
            else
                return item;	
        }).
        filter( item => {
            // Filter by client
            if(filters.cliente)
                if(filters.cliente !== '0')
                    return Number(filters.cliente.split(',')[0]) === item.id_cliente
            return item;
        }).
        filter( item => {
            // Filter by chalan
            if(filters.chalan)
                if(filters.chalan !== '0')
                    return filters.chalan === item.chalan
            return item;
        }).
        filter( item => {
            // Filter by status
            if(filters.estado)
                if(filters.estado !== '0')
                    return Number(filters.estado) === item.estado;
            return item;
        });
    }

    return(
        <Layout active='Pedidos'>
            <Container>
                <div style={ {display: 'flex', justifyContent: 'space-between'} }>
                    <h2>LISTA DE PEDIDOS</h2>
                    <Button className='bg-red' onClick={ () => window.location.reload() }>REINICIAR FILTROS</Button>
                </div>
                <div style={ { overflowX: 'auto', marginTop: 20}}>
                    { filters.chalan !== '0' && filters.chalan && filters.estado === 4 ? <p style={ {fontSize: 20} }>Total PCE chalan <strong>{filters.chalan.split(',')[1]}</strong> = <strong>${ roundNumber((filterData().map( item => item.total_pagar)).reduce( (anterior, actual) => anterior + actual, 0)) }</strong> </p> : null}
                    {/*  tableData ? <TableWraper data={tableData} openEditModal={ openEditModal } openFiarModal={openFiarModal} /> : null  */} 
                    <StyledTable style={{ border: 'solid 1px #000' }}>

                        <thead style={ {backgroundColor: '#26C485'} }>
                            <tr>

                                <td><input type={'date'} style={ {padding: 10, fontSize: '16px'} } onChange={ (event) => setFilters({...filters, fecha: event.target.value }) }/> </td>
                                <td><select name="cliente" style={ {padding: 10, fontSize: '16px'} } onChange={ (event) => setFilters({...filters, cliente: event.target.value }) } >
                                        <option value='0'>Cliente</option>
                                        { clients ? clients.map( cliente => <option value={cliente.id + ',' + cliente.nombre}>{ cliente.nombre}</option>) : null };
                                    </select></td>
                                <td>
                                    <select name="chalan" style={ {padding: 10, fontSize: '16px'} } onChange={ (event) => setFilters({...filters, chalan: event.target.value }) } >
                                        <option value='0'>Chalan</option>
                                        { chalanes ? chalanes.map( chalan => <option value={chalan.id + ',' + chalan.nombre}>{ chalan.nombre}</option>) : null };
                                    </select>
                                </td>
                                <td>Total</td>
                                <td>
                                    <select name="orden_pedidos" style={ {padding: 10, fontSize: '16px'} } onChange={ (event) => setFilters({...filters, estado: Number(event.target.value) }) }>
                                        <option value='0'>Estado</option>
                                        <option value='4'>PCE</option>
                                        <option value='1'>Pagados</option>
                                        <option value='2'>Adeudos</option>
                                    </select>
                                </td>
                                <td>Acciones</td>

                            </tr>
                        </thead>
                        
                        <tbody>
                        { (tableData ? 
                                filterData().map( (item, index) => {
                                    return <tr key={index}>
                                        <td>{ item.fecha }</td>
                                        <td>{ item.id_cliente } - { item.nombre_cliente }</td>
                                        <td><p> { item.chalan ? `${item.chalan.split(',')[0]} - ${item.chalan.split(',')[1]}` : null } </p> </td>
                                        <td>{'$'+ item.total_pagar}</td>
                                        <td>{ getOrderStatusLabel(item) }</td>
                                        <td><div style={ {display: 'flex', flexWrap: 'nowrap'} }>
                        <ActionButton className="bg-primary" medium onClick={ () => openDetailModal(item) }>Detalle</ActionButton>
                        <ActionButton className="bg-light-blue" ml medium onClick={ () => printTicket(item) }>Ticket</ActionButton>
                        { item.estado === 2 || item.estado === 3 ? <ActionButton className="bg-blue" medium ml onClick={ () => { setPaymentModalState({visible: true}); setCurrentOrder(item)  } }>Cobrar</ActionButton> : (item.estado === 4 ? <><ActionButton className="bg-blue" onClick={ () => openEditModal(item) } medium ml>Recibir pago</ActionButton><ActionButton className="bg-red"  onClick={ () => openFiarModal(item) } medium ml>Fiar </ActionButton></>: null) }
                    </div></td>
                                    </tr> 
                                })
                            : null ) }
                        </tbody>
                    </StyledTable>
                </div>
            </Container>

            <Modal title='Mi titulo' visible={ modalState.visible }  handleModalClose={  handleModalClose } >
                { modalState.content }
            </Modal>

            {/* Payment Modal */}
            <Modal title='Payment modal' visible={ paymentModalState.visible }  handleModalClose={ () => { handlePaymentModalClose(); setCurrentNumber(''); } } >
                <ModalForm onSubmit={ event => payOrderPCE(event) }>
                    <Total>Total a pagar: <strong>$ { currentOrder ? currentOrder.total_pagar : 0} </strong></Total>
                    <Change>Cambio: <strong> $ { currentOrder ? ((Number(currentNumber) - currentOrder.total_pagar ) > 0 ? (Number(currentNumber) - currentOrder.total_pagar ) : 0).toFixed(2) : 0} </strong></Change>
                    <PaymentAmount>${ currentNumber ? currentNumber : '0'}</PaymentAmount>
                    <input type='hidden' value={currentNumber ? currentNumber : '0'} name='pago'/>
                    <input type='hidden' name='order_id' value={currentOrder ? currentOrder.id : null} />
                    <input type='hidden' name='total_pagar' value={currentOrder ? currentOrder.total_pagar : null} />
                    <ContraEntrega>
                        { /* <h3 style={{ textAlign: 'center', fontSize: 20}}>Contra engrega <input type='checkbox' style={ {padding: '10px'} } onChange={ (event) => setContraEntrega(event.target.checked) } /></h3> */}
                        <h2>Contra entrega</h2>
                        { chalanesSelect }
                    </ContraEntrega>

                    <Keypad currentNumber={currentNumber} setCurrentNumber={setCurrentNumber} />

                    
                    <ModalButtons>
                        <Button type="submit" className="bg-primary">Pagar</Button>
                        <Button type="button" className="bg-red" onClick={ () => { handlePaymentModalClose(); setCurrentNumber(''); } }>Cancelar</Button>
                    </ModalButtons>
                </ModalForm>
            </Modal>

            <style>
                {`
                    .badge{
                        display: inline-block;
                        padding: 4px;
                        color: #000;
                        border-radius: 5px;
                    }

                    .badge-blue{
                        background-color: #048BA8;
                    }

                    .badge-red{
                        background-color: #FF6F59;
                    }

                    .badge-primary{
                        background-color: #26C485;
                    }
                `}
            </style>
        </Layout>
    );
}