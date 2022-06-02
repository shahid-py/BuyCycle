import axios from "axios";
import { createContext, useContext, useEffect, useReducer, useState } from "react";
import { reducerFunc } from "../reducer/reducer";
import { setUpAuthHeaderForServiceCalls, useAuth } from "./AuthContext";
import { API_URL } from "../utils/index";

export const DataContext = createContext();

 const initialState = {
  inventory: [],
  cart: [],
  wishlist: [],
  sortBy: null,
  showFastDeliveryOnly: false,
  showInventoryAll: false,
  totalPrice: 0,
  sortByTypeOfBike: [],
};

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(reducerFunc, initialState);
  const { token } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const {
          data: { products },
        } = await axios.get(`${API_URL}/products`);

        dispatch({
          type: "INITIALIZE_PRODUCTS",
          payload: products,
        });
      } catch (error) {
        console.error(error);
      }

      setIsLoading(false);
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const {
          data: { cart },
        } = await axios.get(`${API_URL}/cart`);

        dispatch({ type: "INITIALIZE_CART", payload: cart });

        const {
          data: { wishlist },
        } = await axios.get(`${API_URL}/wishlist`);

        dispatch({ type: "INITIALIZE_WISHLIST", payload: wishlist });
      } catch (error) {
        console.error(error);
      }
    };

    if (token) {
      setUpAuthHeaderForServiceCalls(token);
      fetchUserData();
    }
  }, [token]);

  return (
    <DataContext.Provider value={{ state, dispatch, isLoading }}>
      {children}
    </DataContext.Provider>
  );
}

export const useData = () => {
  return useContext(DataContext);
};