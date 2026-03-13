const OpenAI = require("openai");

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const analyzeMeal = async (imageUrl, userProfile, mealContext) => {
  try {

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: require("../utils/systemPrompt")
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                user_profile: userProfile,
                meal_context: mealContext
              })
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ]
    });

    return JSON.parse(response.choices[0].message.content);

  } catch (error) {
    console.error("OpenAI error:", error);
    throw error;
  }
};

module.exports = analyzeMeal;