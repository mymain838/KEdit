import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();
  return (
    <section className="flex justify-center w-[100%] h-[64px] bg-white border-gray-200 border-b-[1px]">
      <div className="flex w-[70%] justify-between items-center">
        <div
          onClick={() => {
            navigate("/");
          }}
          className="text-4xl font-semibold italic cursor-pointer hover:text-yellow-300"
        >
          KE
        </div>
        <div className="flex gap-4">
          <Link className="hover:text-blue-400" to={"video"}>
            비디오 편집
          </Link>
          <Link className="hover:text-blue-400" to={"image"}>
            이미지 편집
          </Link>
          <Link className="hover:text-blue-400" to={"login"}>
            로그인
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Header;
