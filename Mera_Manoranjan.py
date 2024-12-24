import requests
from transformers import pipeline

class MovieSearcher:
    def __init__(self, api_key="YOUR_KEY_HERE"):
        self.api_key = api_key
        self.summarizer = pipeline("summarization", model="facebook/bart-large-cnn")

    def search_movies(self, movie_name, movie_year):
        response = requests.get(f"https://www.omdbapi.com/?s={movie_name}&y={movie_year}&apikey={self.api_key}")
        result = response.json()
        return result.get("Search", [])[:10]

    def display_movie_choices(self, movies):
        for num, movie in enumerate(movies, start=1):
            print(str(num) + ". " + movie.get("Title"), movie.get("Year"))

    def get_movie_summary(self, movie_title, movie_year):
        main_search = movie_title + " " + movie_year
        summary = self.summarizer(main_search, max_length=50, min_length=49, do_sample=False)
        return summary[0]['summary_text']

if __name__ == "__main__":
    movie_name = input("Enter a movie name: \n")
    movie_year = input("Enter a movie year: \n")

    searcher = MovieSearcher()
    movies = searcher.search_movies(movie_name, movie_year)
    print("\n")

    if movies:
        searcher.display_movie_choices(movies)
        ask = int(input("\nWhat movie you want the summary for? Input the corresponding number: \n"))
        selected_movie = movies[ask - 1]
        summary = searcher.get_movie_summary(selected_movie.get("Title"), selected_movie.get("Year"))
        print("\n")
        print(summary)
    else:
        print("No movies found.\n")