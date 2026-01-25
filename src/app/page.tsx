import Carousel from "./components/Carousel";
import MangaList from "./components/MangaList";
import RandomVolumes from "./components/RandomVolumes";

export default function Home() {
  return (
    <div className="flex flex-col font-sans items-center justify-center h-full min-w-full">
      {/* <h1 className="text-3xl">Hello Every one! this is mangakart</h1> */}
      <div className="flex flex-col items-center justify-center h-full min-w-full gap-8 bgimg">

      <div className="bgimg w-full">
        <Carousel/>
        <MangaList/>
      </div>
      </div>
      <div className="bgimg w-full">
        <RandomVolumes/>
      </div>
    </div>
  );
}
