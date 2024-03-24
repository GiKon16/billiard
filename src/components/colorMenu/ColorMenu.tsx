import { FC } from 'react';
import styles from './ColorMenu.module.scss';

interface ColorMenu {
    colors: string[],
    handleColorChange: (color: string) => void,
    closeColorMenu: () => void
}

const ColorMenu: FC<ColorMenu> = ({ colors, handleColorChange, closeColorMenu }) => {
    return (
        <div className={ styles['color-menu'] }>
            <button className={ styles['close-button'] } onClick={ () => closeColorMenu() }>
                close
            </button>
            {
                colors.map((color, index) => 
                    <button 
                        key={ index } 
                        className={ styles['color-change-button'] } 
                        style={{ backgroundColor: color }}
                        onClick={ () => handleColorChange(color) }/>
                )
            }
        </div>
    )
}

export default ColorMenu;
