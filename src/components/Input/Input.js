import styled from 'styled-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faDownload } from '@fortawesome/free-solid-svg-icons';

import { useState, useEffect} from 'react';


const StyledLabel = styled.label`
    & p{
        font-weight: 600;
    }
`;
const StyledInput = styled.input`
    border: solid 2px #000;
    padding: 10px;
    border-radius: 20px;
    width: 100%;
`;

export default function Input(props){
    return(
        <StyledLabel>
            <p>{ props.label }</p>
            <StyledInput type={ props.type ? props.type: 'text'} placeholder={ props.placeholder}  name={ props.name } defaultValue={ props.defaultValue ? props.defaultValue : null} />
        </StyledLabel>
    );
}

export function InputFile(props){

    const [currentFilename, setCurrentFilename] = useState('');
    const fileTypes = ['image/png', 'image/jpg', 'image/jpeg'];

    const changeFilename = (evt) => {

        if(evt.target.files.length > 0){
            let file = evt.target.files[0];
            console.log(file);
            setCurrentFilename(file.name);
            /*    
            if(fileTypes.includes(file.type)){
                
                let fr = new FileReader()
                if(fr){
                    fr.readAsDataURL(file);
                }
    
                fr.onloadend = ()  => {
                    console.log(fr.result);
                    setCurrentUserImg(fr.result);
                }
                
            }
            else{
                alert('Tipo de archivo no permitido');
            }
            */
        }
        else{
            setCurrentFilename(<span><FontAwesomeIcon icon={faPlus}/> Agregar</span>);
        }
    }

    const handleOnChange = (evt) => {
        changeFilename(evt); 
        props.onChange(evt);
    }

    useEffect(() => {
        if(props.value){
            setCurrentFilename(props.value);
        }

        else{
            setCurrentFilename(<span><FontAwesomeIcon icon={faPlus}/> Agregar</span>);
        }
    }, [])

    return(
        <div>
            <label>
                
                <div className='bg-acent inline-block text-white p-2 cursor-pointer'>{ props.value ? currentFilename.split('/')[currentFilename.split('/').length -1] :currentFilename} </div>
                <input type='file' name={props.name} placeholder={props.placeholder}  onChange={ handleOnChange } className='bg-gray-200 p-2 w-full hidden' />
            </label>
            {
                props.value ? 
                    <span><br/><a target='_blank' href={props.value} className='bg-primary inline-block text-white p-2 mt-2'><FontAwesomeIcon icon={faDownload} /> Descargar</a></span>
                :
                null
            }
        </div>
    );
}