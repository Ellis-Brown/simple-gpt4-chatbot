import ChatApplication from '@/components/ChatApplication';

const SlideableDiv = () => {

  return (
    <div className="flex h-full">
      <div className="w-1/2 p-3">
        <ChatApplication />
      </div>
      <div
        className="w-1/2 p-3 bg-gray-900">
        <ChatApplication />
      </div>
    </div>
  );
};

export default SlideableDiv;