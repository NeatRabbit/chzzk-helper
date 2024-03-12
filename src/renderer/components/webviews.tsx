import useUserIdHash from "../electronApi/useUserIdHash";

export default function Webviews() {
  const {
    data: {
      content: { userIdHash },
    },
  } = useUserIdHash();

  return (
    <>
      <webview
        src={`https://chzzk.naver.com/live/${userIdHash}/chat`}
        className="border-0 min-w-[353px] flex-[353] h-full"
      ></webview>
      <webview
        src={`https://studio.chzzk.naver.com/${userIdHash}/remotecontrol`}
        className="border-0 min-w-[560px] flex-[560] h-full"
      ></webview>
    </>
  );
}
