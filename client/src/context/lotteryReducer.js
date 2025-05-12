// initial state
export const initialState = {
    account: null,
    contract: null,
    provider: null,
    signer: null,
    isLoading: false,
    error: null,
}
export const lotteryReducer = (state = initialState, action) => {
    switch (action.type) {
        case "SET_LOADING":
            return { ...state, isLoading: true, error: null }
        case "SET_CONNECTED":
            return {
                ...state,
                account: action.payload.account,
                contract: action.payload.contract,
                provider: action.payload.provider,
                signer: action.payload.signer,
                isLoading: false,
                error: null,
            }

        case "SET_ERROR":
            return { ...state, isLoading: false, error: action.payload }
        case "RESET":
            return initialState
        default:
            return state
    }


}
