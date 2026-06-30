import { createContext, useEffect, useState } from "react";
import axios from 'axios'
import {toast} from 'react-toastify'

export const authContext = createContext(null);

const const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null);
    // const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const loadData = async() => {
            // const responce = await axios.get()
        }
    })
}