// frontend/src/components/OpenModalButton/OpenModalButton.jsx
import useModal from '../../context/useModal'

function OpenModalButton({
  modalComponent,
  buttonText,
  onButtonClick,
  onModalClose,
  buttonClassName
}) {
  const { setModalContent, setOnModalClose } = useModal();

  const onClick = () => {
    if (typeof onButtonClick === 'function') onButtonClick();
    setOnModalClose(onModalClose);
    setModalContent(modalComponent);
  };

  return (
    <button className={buttonClassName} onClick={onClick}>
      {buttonText}
    </button>
  );
}

export default OpenModalButton;
