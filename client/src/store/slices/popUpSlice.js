import { createSlice } from '@reduxjs/toolkit';

const popUpSlice = createSlice({
    name: 'popup',
    initialState: {
        settingPopup: false,
        addBookPopup: false,
        readBookPopup: false,
        recordBookPopup: false,
        returnBookPopup: false,
        addNewAdminPopup: false,
        deleteBookPopup: false,
        bookIdToDelete: null,
    },
    reducers: {
        toggleSettingPopup: (state) => {
            state.settingPopup = !state.settingPopup;
        },
        toggleAddBookPopup: (state) => {
            state.addBookPopup = !state.addBookPopup;
        },
        toggleReadBookPopup: (state) => {
            state.readBookPopup = !state.readBookPopup;
        },
        toggleRecordBookPopup: (state) => {
            state.recordBookPopup = !state.recordBookPopup;
        },
        toggleReturnBookPopup: (state) => {
            state.returnBookPopup = !state.returnBookPopup;
        },
        toggleAddNewAdminPopup: (state) => {
            state.addNewAdminPopup = !state.addNewAdminPopup;
        },
        toggleDeleteBookPopup: (state, action) => {
            state.deleteBookPopup = !state.deleteBookPopup;
            // Fixed: Use assignment operator (=) instead of comparison operator (==)
            state.bookIdToDelete = action?.payload || null;
        },
        // Fixed: Corrected typo from 'clossAllPopUps' to 'closeAllPopUps'
        closeAllPopUps: (state) => {
            state.settingPopup = false;
            state.addBookPopup = false;
            state.readBookPopup = false;
            state.recordBookPopup = false;
            state.returnBookPopup = false;
            state.addNewAdminPopup = false;
            state.deleteBookPopup = false;
            state.bookIdToDelete = null;
        },
        // Additional utility reducers for better control
        openDeleteBookPopup: (state, action) => {
            state.deleteBookPopup = true;
            state.bookIdToDelete = action.payload;
        },
        closeDeleteBookPopup: (state) => {
            state.deleteBookPopup = false;
            state.bookIdToDelete = null;
        },
        setBookIdToDelete: (state, action) => {
            state.bookIdToDelete = action.payload;
        },
    },
});

export const {
    toggleSettingPopup,
    toggleAddBookPopup,
    toggleReadBookPopup,
    toggleRecordBookPopup,
    toggleReturnBookPopup,
    toggleAddNewAdminPopup,
    toggleDeleteBookPopup,
    closeAllPopUps, // Fixed: Updated export name
    openDeleteBookPopup,
    closeDeleteBookPopup,
    setBookIdToDelete,
} = popUpSlice.actions;

export const selectPopUp = (state) => state.popup;

// Additional selectors for better usability
export const selectDeleteBookPopup = (state) => state.popup.deleteBookPopup;
export const selectBookIdToDelete = (state) => state.popup.bookIdToDelete;
export const selectAnyPopupOpen = (state) => {
    const popup = state.popup;
    return popup.settingPopup || 
           popup.addBookPopup || 
           popup.readBookPopup || 
           popup.recordBookPopup || 
           popup.returnBookPopup || 
           popup.addNewAdminPopup || 
           popup.deleteBookPopup;
};

export default popUpSlice.reducer;