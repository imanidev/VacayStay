import useModal from '../../context/useModal';
import styles from './ReserveFeatureModal.module.css';

function ReserveModal() {
  const { closeModal } = useModal();

  const handleBackgroundClick = (e) => {
    // Ensure closing if the user clicks on the background.
    if (e.target.classList.contains(styles.modalBackground)) {
      closeModal();
    }
  };

  return (
    <div className={styles.modalBackground} onClick={handleBackgroundClick}>
      <div className={styles.reserveModalContent}>
        <p className={styles.reserveModalText}>Feature Coming Soon...</p>
      </div>
    </div>
  );
}

export default ReserveModal;
