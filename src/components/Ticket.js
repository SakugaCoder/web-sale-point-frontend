import styled from "styled-components";
import Button from "./Button";

import { getTotal } from '../utils/Operations';

const TicketContainer = styled.div`
    width: 35%;
    padding: 20px 20px 0px 20px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

`;

const TicketContent = styled.div`
    background: white;
    padding: 10px;
    border-radius: 10px;
    border: solid 1px #DAEFE7;
    max-height: 50vh;
    overflow-y: auto;
    h3{
        font-size: 40px;
        margin-bottom: 10px;
    }

    p{
        font-size: 30px;
        margin: 5px 0px;
    }
`;

const TicketButtons = styled.div`
`;

const TicketButton = styled(Button)`
    width: 100%;
    margin-top: 20px;
    border-radius: 60px;
`;

const Total = styled.div`
    font-size: 30px;
    margin-top: 20px;
`;

export default function Ticket(props){

    function printPageArea(){
        var printContent = document.getElementById('ticket-content');
        var WinPrint = window.open('', '', 'width=900,height='+printContent.clientHeight);
        WinPrint.document.write(printContent.innerHTML);
        WinPrint.document.close();
        WinPrint.focus();
        WinPrint.print();
        WinPrint.close();
    }

    return(
        <TicketContainer>
            <TicketContent id="ticket-content">
                    <h3 style={ {textAlign: 'center' }}>Pedido</h3>
                    { props.items.map( item => 
                        <p>{ item.name } <strong>x</strong> { item.kg } kg = <strong> ${ Math.floor(Number(item.price) * item.kg) }</strong></p>
                    )}
                    <br/>
            </TicketContent>
            <Total><strong>Total: </strong>$ { getTotal(props.items) }</Total>


            <TicketButtons>
                <TicketButton className="bg-primary" onClick={ props.payOrder }>COBRAR</TicketButton>
                { props.restrictedMode ? null : <TicketButton className="bg-blue" onClick={ () => props.openPaymentModal(true) }>FIAR PEDIDO</TicketButton> }
                <TicketButton className="bg-red" onClick={ props.cancelOrder }>CANCELAR</TicketButton>
            </TicketButtons>
        </TicketContainer>
    );
}