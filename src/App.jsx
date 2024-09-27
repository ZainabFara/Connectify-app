import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Chat from './components/Chat';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/', 
    element: <Login/>
  },
  {
    path: '/login', 
    element: <Login/>
  },
  {
    path: '/register',
    element: <Register/>
  },
  {
    path: '/chat',
    element: <Chat/>
  },
]);

function App() {
    return (
       <div>
          <RouterProvider router={router}/>
       </div>
    );
}

export default App;


