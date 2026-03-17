async function checkIsSignin(router) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const data = await response.json();

    if (!data.result) {
      // "replace" remplace la route actuelle, alors que "push" empile l'ancienne page dans l'historique
      //router.push(`/signin`);
      router.replace("/signin");
    }
  } catch (e) {
    console.error("Fetch user failed:", e);
  }
}

async function checkNeedSignin(router) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/me`,
      {
        method: "GET",
        credentials: "include",
      },
    );

    const data = await response.json();

    if (data.result) {
      console.log(data.user.role);
      if (data.user.role === "teacher") {
        router.replace(`/dashboard_teacher`);
      } else {
        router.replace(`/dashboard_student`);
      }
    }
  } catch (e) {
    console.error("Fetch user failed:", e);
  }
}

module.exports = { checkIsSignin, checkNeedSignin };
