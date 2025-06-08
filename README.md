# Quicky — Smart Content to Quiz Generator

Quicky is a full-stack web application that allows users to upload files (PDF, DOCX, PPTX, TXT) or YouTube video links. The application extracts textual content, generates AI-based questions, and allows users to take interactive quizzes based on that content.

## Tech Stack

*   **Frontend:** React.js, Material-UI (MUI), React Router, Axios
*   **Backend:** Django, Django REST Framework (DRF)
*   **Database:** PostgreSQL

## Project Structure

```
Quicky/
├── backend/        # Django backend
│   ├── quicky_project/ # Django project configuration
│   ├── sources/      # Django app for handling content sources
│   ├── questions/    # Django app for handling questions and quizzes
│   ├── media/        # For storing uploaded files (if not using cloud storage)
│   ├── manage.py
│   └── requirements.txt
└── frontend/       # React frontend
    ├── public/
    └── src/
        ├── components/
        ├── pages/
        ├── App.js
        ├── index.js
        └── ...
```

## Setup and Installation

### Backend (Django)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    python -m venv venv
    # On Windows
    venv\Scripts\activate
    # On macOS/Linux
    source venv/bin/activate
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Configure your database:**
    *   Ensure PostgreSQL is installed and running.
    *   Create a database (e.g., `quicky_db`).
    *   Update the database settings in `backend/quicky_project/settings.py` with your credentials:
        ```python
        DATABASES = {
            'default': {
                'ENGINE': 'django.db.backends.postgresql',
                'NAME': 'quicky_db',        # Your DB name
                'USER': 'your_db_user',     # Your DB user
                'PASSWORD': 'your_db_password', # Your DB password
                'HOST': 'localhost',
                'PORT': '5432',
            }
        }
        ```

5.  **Apply database migrations:**
    ```bash
    python manage.py makemigrations sources questions
    python manage.py migrate
    ```

6.  **Create a superuser (for admin access):**
    ```bash
    python manage.py createsuperuser
    ```

7.  **Run the development server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be available at `http://localhost:8000/api/`.

### Frontend (React)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Run the development server:**
    ```bash
    npm start
    # or
    yarn start
    ```
    The frontend application will be available at `http://localhost:3000`.

## Development URLs

*   **Frontend:** `http://localhost:3000`
*   **Backend API:** `http://localhost:8000/api/`
*   **Django Admin:** `http://localhost:8000/admin/`

## Key Features

*   File & Link Upload: PDF, DOCX, PPTX, TXT, YouTube links.
*   Text Extraction: From documents and video transcripts.
*   AI-Powered Question Generation: Customizable based on page/time ranges and question limits (placeholder AI logic currently).
*   Interactive Quizzing Interface: Tracks answers, scores, and progress.
*   File Management: View and delete uploaded sources.
*   Modern UI: Built with Material-UI for a responsive interface.

## Further Development

*   **Implement actual AI for Question Generation:** Integrate with services like OpenAI GPT, Hugging Face models, or other NLP libraries in `backend/questions/utils.py`.
*   **Refine Text Extraction:** Improve accuracy and handling of complex layouts in PDFs and PPTX files.
*   **Advanced Quiz Features:** Timers, different question types, feedback mechanisms.
*   **User Authentication:** Secure user accounts and personal quiz history.
*   **Deployment:** Configure for production deployment (e.g., Docker, Gunicorn, Nginx, cloud platforms).
*   **Testing:** Add comprehensive unit and integration tests for both backend and frontend.