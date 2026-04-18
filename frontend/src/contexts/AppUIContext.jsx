import React, { createContext, useContext, useMemo, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

const AppUIContext = createContext(null);

export const useAppUI = () => {
    const context = useContext(AppUIContext);
    if (!context) {
        throw new Error('useAppUI must be used within AppUIProvider');
    }
    return context;
};

export const AppUIProvider = ({ children }) => {
    const [confirmState, setConfirmState] = useState({
        open: false,
        title: '',
        message: '',
        confirmLabel: 'Confirm',
        cancelLabel: 'Cancel',
        variant: 'danger',
        resolve: null,
    });

    const value = useMemo(() => ({
        notifySuccess: (message) => toast.success(message, { position: 'top-center' }),
        notifyError: (message) => toast.error(message, { position: 'top-center' }),
        notifyInfo: (message) => toast.info(message, { position: 'top-center' }),
        confirm: ({ title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', variant = 'danger' }) =>
            new Promise((resolve) => {
                setConfirmState({
                    open: true,
                    title,
                    message,
                    confirmLabel,
                    cancelLabel,
                    variant,
                    resolve,
                });
            }),
    }), []);

    const closeConfirm = (result) => {
        if (confirmState.resolve) {
            confirmState.resolve(result);
        }
        setConfirmState((prev) => ({
            ...prev,
            open: false,
            resolve: null,
        }));
    };

    return (
        <AppUIContext.Provider value={value}>
            {children}

            <Modal show={confirmState.open} onHide={() => closeConfirm(false)} centered backdrop="static">
                <Modal.Header closeButton>
                    <Modal.Title>{confirmState.title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{confirmState.message}</Modal.Body>
                <Modal.Footer>
                    <Button variant="light" onClick={() => closeConfirm(false)}>
                        {confirmState.cancelLabel}
                    </Button>
                    <Button variant={confirmState.variant} onClick={() => closeConfirm(true)}>
                        {confirmState.confirmLabel}
                    </Button>
                </Modal.Footer>
            </Modal>
        </AppUIContext.Provider>
    );
};
