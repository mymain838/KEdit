import { WarningTwoTone } from "@ant-design/icons";

const NotFound = () => {
  return (
    <article className="w-full h-screen flex justify-center items-center text-center">
      <div className="flex flex-col gap-4 items-center">
        <WarningTwoTone className="text-[150px]" />
        <span className="text-2xl font-bold">
          현재 페이지는 개발중에 있습니다.
        </span>
      </div>
    </article>
  );
};

export default NotFound;
