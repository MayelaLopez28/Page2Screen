export const genreMap = {
    tmdbToOl: {
        '878': 'science_fiction',
        '14': 'fantasy',
        '27': 'horror',
        '9648': 'mystery_and_detective_stories',
        '53': 'thriller',
        '10749': 'romance',
        '12': 'adventure',
        '36': 'history',
        '80': 'crime',
        '10752': 'war',
        '18': 'drama'
    } as Record<string, string>,

    olToTmdb: {
        'science_fiction': '878',
        'sci-fi': '878',
        'science-fiction': '878',
        'fantasy': '14',
        'horror': '27',
        'mystery_and_detective_stories': '9648',
        'mystery': '9648',
        'thriller': '53',
        'romance': '10749',
        'adventure': '12',
        'history': '36',
        'crime': '80',
        'war': '10752',
        'drama': '18',
        'fiction': '18',
        'young_adult_fiction': '12',
        'dystopia': '878',
        'cyberpunk': '878',
    } as Record<string, string>
};