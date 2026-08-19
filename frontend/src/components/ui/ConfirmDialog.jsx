import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirmation Required',
  message = 'Are you sure you want to perform this action?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'danger'
}) => {
  const footer = (
    <>
      <Button variant="secondary" onClick={onClose}>{cancelText}</Button>
      <Button variant={type === 'danger' ? 'danger' : type === 'warning' ? 'warning' : 'primary'} onClick={onConfirm}>
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} footer={footer} size="sm">
      <p className="text-sm text-gray-500 leading-relaxed">{message}</p>
    </Modal>
  );
};

export default ConfirmDialog;
