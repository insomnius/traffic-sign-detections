import TrafficSignDetection from '@/app/components/trafficSignDetection';

export default function Home() {
  return (
    <div className='bg-white h-svh p-10 flex flex-col align-middle items-center gap-6'>
      <h1 className='text-xl font-bold'>Traffic Sign Detection</h1>
      <TrafficSignDetection />
    </div>
  );
}
