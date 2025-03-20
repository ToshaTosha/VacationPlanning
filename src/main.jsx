import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { Provider, useDispatch } from "react-redux";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import {
  LoginPage,
  CreateVacationPage,
  PlannedVacationsPage,
  ProfilePage,
  EmployeesPage,
} from '@/pages';
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import './main.css';
import store from "@/redux/store.js";
import { fetchUserDataStart, fetchUserDataSuccess, fetchUserDataFailure } from '@/redux/userSlice';
import { getEmployee } from '@/api/employees';


console.log('11')
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("root element not found");


const App = () => {
  const dispatch = useDispatch();

    useEffect(() => {
        const token = Cookies.get('token'); // Получаем токен из куки
        if (token) {
          const decodedToken = jwtDecode(token);
            fetchUserData(decodedToken.EmployeeId);
        }
    }, [dispatch]);

    const fetchUserData = async (userId) => {
        dispatch(fetchUserDataStart());
        try {
            const response = await getEmployee(userId);
            if (response.status !== 200) {
                throw new Error('Failed to fetch user data');
            }
            const userData = await response.data;
            dispatch(fetchUserDataSuccess(userData));
        } catch (error) {
            dispatch(fetchUserDataFailure(error.message));
        }
    };
  return (
    <>
      <Sidebar />
      <div className="app-container p-6">
        <Header />
          <Routes>
            <Route path="/create-vacation" element={<CreateVacationPage />} />
            <Route path="/planned-vacation" element={<PlannedVacationsPage />} />
            <Route path="/home/:id" element={<ProfilePage />} />
            <Route path="/employees" element={<EmployeesPage />} />
          </Routes>
      </div>
    </>
  );
};

const root = createRoot(rootElement);
root.render(
  <Provider store={store}>
    <Router>
      <Routes>
        {/* Публичный маршрут (только для неавторизованных) */}
        <Route path="/login" element={<LoginPage />} />

        {/* Приватные маршруты (только для авторизованных) */}
        <Route path="/*" element={<App />}/>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  </Provider>
);
