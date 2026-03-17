import "../styles/globals.css";
import Head from "next/head";
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from "redux-persist/integration/react";
import storage from "redux-persist/lib/storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import planning from "../reducers/planning";
import students from "../reducers/students";
import payments from "../reducers/payments";
import invoices from "../reducers/invoices";
import { Provider } from "react-redux";

const reducers = combineReducers({ planning, students, payments, invoices });

const persistConfig = { key: "myTeacher", storage };

const store = configureStore({
  reducer: persistReducer(persistConfig, reducers),
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});

const persistor = persistStore(store);

function App({ Component, pageProps }) {
  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <Head>
          <title>MyTeacher App</title>
          <link rel="icon" href="/LogoMT.ico" />
        </Head>
        <Component {...pageProps} />
      </PersistGate>
    </Provider>
  );
}

export default App;
