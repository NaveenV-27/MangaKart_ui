import Carousel from "./components/Carousel";
import MangaList from "./components/MangaList";
import RandomVolumes from "./components/RandomVolumes";

export default function Home() {
  return (
    <div className="flex flex-col font-sans items-center justify-center h-full min-w-full gap-16 bgimg">
      {/* <h1 className="text-3xl">Hello Every one! this is mangakart</h1> */}
      <Carousel/>
      <MangaList/>
      <RandomVolumes/>
    </div>
  );
}
