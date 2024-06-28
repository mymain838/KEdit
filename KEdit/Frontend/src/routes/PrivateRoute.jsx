import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Loading from "../components/Loading";

const PrivateRoute = () => {
  return (
    <article className="flex flex-col items-center">
      <Header />
      <div className="bg-green-100 w-[70%] min-h-[600px] p-6">
        <Outlet />
      </div>
    </article>
  );
};

export default PrivateRoute;
