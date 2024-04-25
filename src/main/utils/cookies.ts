import { CookiesSetDetails, Session } from "electron";

export function setCookies({url, cookies, session}: {url: string, cookies: string[], session: Session}) {
  const promises = cookies.map(cookie => {
    const setCookie: CookiesSetDetails = {
      url,
    };

    cookie.split("; ").map(parts => {
      const part = parts.split("=");
      return {
        key: part[0],
        value: part?.[1],
      };
    }).forEach((part, index) => {
      if (index === 0) {
        setCookie.name = part.key;
        setCookie.value = part.value;
      } else {
        switch (part.key.toLowerCase()) {
          case "domain":
            setCookie.domain = part.value;
            break;
          case "path":
            setCookie.path = part.value;
            break;
          case "samesite":
            setCookie.sameSite = part.value.toLowerCase() as "unspecified" | "no_restriction" | "lax" | "strict";
            break;
          case "expires":
            setCookie.expirationDate = getSecondsSinceEpoch(part.value);
            break;
          case "secure":
            setCookie.secure = true;
            break;
          case "httponly":
            setCookie.httpOnly = true;
            break;
        }
      }
    });

    return session.cookies.set(setCookie);
  });

  return Promise.all(promises);
}

function getSecondsSinceEpoch(dateString: string) {
  const date = new Date(dateString);
  return Math.floor(date.getTime() / 1000);
}

// 세션 쿠키를 가져오는 비동기 함수
export async function getCookies(sessionCookies: Electron.Cookies): Promise<string> {
  const cookies = await sessionCookies.get({});
  const cookieString = cookies.map(cookie => `${cookie.name}=${cookie.value}`).join(';');
  return cookieString;
}
