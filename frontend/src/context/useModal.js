// frontend/src/context/useModal.js
import { useContext } from 'react';
import { ModalContext } from './Modal';

const useModal = () => useContext(ModalContext);

export default useModal;
