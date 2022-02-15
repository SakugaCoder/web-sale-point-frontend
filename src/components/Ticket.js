import styled from "styled-components";
import Button from "./Button";

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
`;

const TicketButtons = styled.div`
`;

const TicketButton = styled(Button)`
    width: 100%;
    margin-top: 20px;
`;
export default function Ticket(props){
    return(
        <TicketContainer>
            <TicketContent>
                    <h3 style={ {textAlign: 'center', marginBottom: 20} }>Pedido</h3>
                    { props.items.map( item => 
                        <p>{ item.name } { item.kg } kg = <strong> ${ Math.floor(Number(item.price) * item.kg) }</strong></p>
                    )}
            </TicketContent>

            <TicketButtons>
                <TicketButton className="bg-primary">ENVIAR</TicketButton>
                <TicketButton className="bg-red">CANCELAR</TicketButton>
            </TicketButtons>
        </TicketContainer>
    );
}