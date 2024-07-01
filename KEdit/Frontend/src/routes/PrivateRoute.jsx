import { Outlet } from "react-router-dom";
import Header from "../components/Header";

const PrivateRoute = () => {
  return (
    <article className="flex flex-col items-center">
      <Header />
      <div className=" w-[70%] min-h-[600px] p-6">
        <Outlet />
      </div>
    </article>
  );
};

export default PrivateRoute;
