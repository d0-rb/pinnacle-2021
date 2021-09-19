import { createStore } from 'redux';

// Actions and helpers
export const storeUserUid = (uid) => {
    return {
        type: "STORE_USER_UID",
        uid
    }
}
function storeUserUidHelper(state, uid) {
    let temp = Object.assign(state);
    temp.auth.user = uid;
    return temp;
}



// Store stuff
let templateState = {
    auth: {
        user: null
    }
}
// Reducer
const storeReducer = (state = templateState, action) => {
    switch (action.type) {
        case 'STORE_USER_UID':
            return storeUserUidHelper(state, action.uid) // Saves user id
        default: 
            return state;
    }
}

export const store = createStore(storeReducer);