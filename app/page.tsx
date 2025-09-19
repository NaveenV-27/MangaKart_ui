import Carousel from "./components/Carousel";

export default function Home() {
  return (
    <div className="flex font-sans items-center justify-center h-full min-w-full gap-16">
      {/* <h1 className="text-3xl">Hello Every one! this is mangakart</h1> */}
      <Carousel/>
    </div>
  );
}
